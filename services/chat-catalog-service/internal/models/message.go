package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	SenderID     string             `bson:"senderId" json:"senderId"`
	SenderName   string             `bson:"senderName" json:"senderName"`
	ReceiverID   string             `bson:"receiverId" json:"receiverId"`
	ReceiverName string             `bson:"receiverName" json:"receiverName"`
	Content      string             `bson:"content" json:"content"`
	Timestamp    time.Time          `bson:"timestamp" json:"timestamp"`
	OrderID      string             `bson:"orderId,omitempty" json:"orderId,omitempty"`
	IsRead       bool               `bson:"isRead" json:"isRead"`
}
