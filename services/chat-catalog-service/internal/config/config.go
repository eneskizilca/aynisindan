package config

import (
	"os"
)

type Config struct {
	MongoURI  string
	Port      string
	JWTSecret string
}

func Load() *Config {
	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "aynisindanplatformusecretkeyformjwttokengenerationmustbelongenough"
	}

	return &Config{
		MongoURI:  mongoURI,
		Port:      port,
		JWTSecret: jwtSecret,
	}
}
