package supabase

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func UploadToSupabase(fileHeader *multipart.FileHeader, bucketName string, filePath string) (string, error) {
	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_SECRET_KEY")

	if supabaseURL == "" || supabaseKey == "" {
		return "", fmt.Errorf("supabase credentials are not set in .env")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %v", err)
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %v", err)
	}

	contentType := fileHeader.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream"
	}

	apiURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", supabaseURL, bucketName, filePath)

	req, err := http.NewRequest("POST", apiURL, bytes.NewReader(fileBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+supabaseKey)
	req.Header.Set("apiKey", supabaseKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("x-upsert", "true")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, err := io.ReadAll(resp.Body)
		if err != nil {
			return "", fmt.Errorf("supabase error: %d (failed to read response body: %v)", resp.StatusCode, err)
		}
		return "", fmt.Errorf("supabase_error: %d - %s", resp.StatusCode, string(body))
	}

	publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", supabaseURL, bucketName, filePath)
	return publicURL, nil
}
