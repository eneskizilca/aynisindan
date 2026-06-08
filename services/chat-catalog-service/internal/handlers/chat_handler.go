package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/aynisindan/chat-catalog-service/internal/db"
	"github.com/aynisindan/chat-catalog-service/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for testing/development
	},
}

// Client represents the active websocket connection of a user
type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan []byte
	Hub    *Hub
}

// Hub coordinates connections, registrations, and private message routing
type Hub struct {
	Clients    map[string]*Client // maps user UUIDs to their Client connection
	Register   chan *Client
	Unregister chan *Client
}

var GlobalHub = &Hub{
	Clients:    make(map[string]*Client),
	Register:   make(chan *Client),
	Unregister: make(chan *Client),
}

// Run executes the registration coordinator loop
func (h *Hub) Run() {
	log.Println("🚀 WebSocket Hub is running...")
	for {
		select {
		case client := <-h.Register:
			h.Clients[client.UserID] = client
			log.Printf("🔌 Client registered: %s (Total online: %d)", client.UserID, len(h.Clients))
		case client := <-h.Unregister:
			if _, ok := h.Clients[client.UserID]; ok {
				delete(h.Clients, client.UserID)
				close(client.Send)
				log.Printf("🔌 Client unregistered: %s (Total online: %d)", client.UserID, len(h.Clients))
			}
		}
	}
}

func (c *Client) readPump() {
	defer func() {
		c.Hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, messageBytes, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Unexpected WS close: %v", err)
			}
			break
		}

		// Parse the message sent by client
		var msgInput struct {
			ReceiverID   string `json:"receiverId"`
			ReceiverName string `json:"receiverName"`
			SenderName   string `json:"senderName"`
			Content      string `json:"content"`
			OrderID      string `json:"orderId"`
		}

		if err := json.Unmarshal(messageBytes, &msgInput); err != nil {
			log.Printf("Unmarshal message error: %v", err)
			continue
		}

		if msgInput.ReceiverID == "" || msgInput.Content == "" {
			continue
		}

		// Construct message log
		msg := models.Message{
			ID:           primitive.NewObjectID(),
			SenderID:     c.UserID,
			SenderName:   msgInput.SenderName,
			ReceiverID:   msgInput.ReceiverID,
			ReceiverName: msgInput.ReceiverName,
			Content:      msgInput.Content,
			Timestamp:    time.Now(),
			OrderID:      msgInput.OrderID,
			IsRead:       false,
		}

		// Store in MongoDB
		collection := db.GetCollection("messages")
		_, err = collection.InsertOne(context.TODO(), msg)
		if err != nil {
			log.Printf("MongoDB save message error: %v", err)
			continue
		}

		resBytes, _ := json.Marshal(msg)

		// Direct deliver to recipient if online
		if targetClient, ok := c.Hub.Clients[msg.ReceiverID]; ok {
			select {
			case targetClient.Send <- resBytes:
				log.Printf("⚡ Message dynamically delivered: %s -> %s", msg.SenderID, msg.ReceiverID)
			default:
				close(targetClient.Send)
				delete(c.Hub.Clients, msg.ReceiverID)
			}
		} else {
			log.Printf("💤 Receiver offline. Message stored for: %s", msg.ReceiverID)
		}

		// Echo message back to sender as confirmation
		select {
		case c.Send <- resBytes:
		default:
			// connection closed
		}
	}
}

func (c *Client) writePump() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Drain remaining messages in queue
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}
		}
	}
}

// HandleWS upgrades HTTP and handles WebSocket messaging sessions
func HandleWS(c *gin.Context, jwtSecret string) {
	tokenString := c.Query("token")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token query parameter is required"})
		return
	}

	// Validate JWT Token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(jwtSecret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired JWT token"})
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	userID, _ := claims["userId"].(string)
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "UserID claim is required"})
		return
	}

	// Upgrade request to WebSocket
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Upgrade websocket error: %v", err)
		return
	}

	client := &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
		Hub:    GlobalHub,
	}

	// Register in hub
	client.Hub.Register <- client

	// Start goroutines for read and write loops
	go client.writePump()
	go client.readPump()
}

// GetChatHistory handles GET /api/v1/chat/history?otherUserId=...
func GetChatHistory(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userUUID := userID.(string)

	otherUserID := c.Query("otherUserId")
	if otherUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "otherUserId query parameter is required"})
		return
	}

	collection := db.GetCollection("messages")

	// Filter messages exchanged between these two users
	filter := bson.M{
		"$or": []bson.M{
			{"senderId": userUUID, "receiverId": otherUserID},
			{"senderId": otherUserID, "receiverId": userUUID},
		},
	}

	opts := options.Find().SetSort(bson.M{"timestamp": 1})
	cursor, err := collection.Find(context.TODO(), filter, opts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	messages := []models.Message{}
	if err = cursor.All(context.TODO(), &messages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Proactively mark incoming messages from otherUserID to userUUID as read
	readFilter := bson.M{
		"senderId":   otherUserID,
		"receiverId": userUUID,
		"isRead":     false,
	}
	update := bson.M{
		"$set": bson.M{"isRead": true},
	}
	_, err = collection.UpdateMany(context.TODO(), readFilter, update)
	if err != nil {
		log.Printf("Mark messages read error: %v", err)
	}

	c.JSON(http.StatusOK, messages)
}

// Conversation represents grouped chat metrics with a user
type Conversation struct {
	CounterPartyID   string    `bson:"_id" json:"counterPartyId"`
	CounterPartyName string    `bson:"counterPartyName" json:"counterPartyName"`
	LastMessage      string    `bson:"lastMessage" json:"lastMessage"`
	LastTimestamp    time.Time `bson:"lastTimestamp" json:"lastTimestamp"`
	LastOrderID      string    `bson:"lastOrderId" json:"lastOrderId"`
	UnreadCount      int       `bson:"unreadCount" json:"unreadCount"`
}

// GetConversations handles GET /api/v1/chat/conversations
func GetConversations(c *gin.Context) {
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userUUID := userID.(string)

	collection := db.GetCollection("messages")

	// Group and fetch active conversations list
	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{
			"$or": []bson.M{
				{"senderId": userUUID},
				{"receiverId": userUUID},
			},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "timestamp", Value: -1}}}},
		{{Key: "$project", Value: bson.M{
			"senderId":     1,
			"senderName":   1,
			"receiverId":   1,
			"receiverName": 1,
			"content":      1,
			"timestamp":    1,
			"orderId":      1,
			"isRead":       1,
			"counterPartyId": bson.M{
				"$cond": bson.A{
					bson.M{"$eq": bson.A{"$senderId", userUUID}},
					"$receiverId",
					"$senderId",
				},
			},
			"counterPartyName": bson.M{
				"$cond": bson.A{
					bson.M{"$eq": bson.A{"$senderId", userUUID}},
					"$receiverName",
					"$senderName",
				},
			},
		}}},
		{{Key: "$group", Value: bson.M{
			"_id":              "$counterPartyId",
			"counterPartyName": bson.M{"$first": "$counterPartyName"},
			"lastMessage":      bson.M{"$first": "$content"},
			"lastTimestamp":    bson.M{"$first": "$timestamp"},
			"lastOrderId":      bson.M{"$first": "$orderId"},
			"unreadCount": bson.M{
				"$sum": bson.M{
					"$cond": bson.A{
						bson.M{"$and": []bson.M{
							{"$eq": bson.A{"$receiverId", userUUID}},
							{"$eq": bson.A{"$isRead", false}},
						}},
						1,
						0,
					},
				},
			},
		}}},
		{{Key: "$sort", Value: bson.D{{Key: "lastTimestamp", Value: -1}}}},
	}

	cursor, err := collection.Aggregate(context.TODO(), pipeline)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.TODO())

	conversations := []Conversation{}
	if err = cursor.All(context.TODO(), &conversations); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, conversations)
}
