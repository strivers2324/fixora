package utils

import (
	"path/filepath"
)

func GetFileExtension(filename string) string {
	ext := filepath.Ext(filename)
	if ext == "" {
		return ".jpg"
	}
	return ext
}
