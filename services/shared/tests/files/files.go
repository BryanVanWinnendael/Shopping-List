package files

import (
	"os"
	"testing"
)

func SetupFile(t *testing.T, file string, data []byte) {
	t.Helper()

	f, err := os.Create(file)
	if err != nil {
		t.Fatalf("could not create file: %v", err)
	}

	if len(data) > 0 {
		if _, err := f.Write(data); err != nil {
			_ = f.Close()
			t.Fatalf("could not write file: %v", err)
		}
	}

	if err := f.Close(); err != nil {
		t.Fatalf("could not close file: %v", err)
	}

	t.Cleanup(func() { RemoveFile(t, file) })
}

func RemoveFile(t *testing.T, file string) {
	if err := os.Remove(file); err != nil && !os.IsNotExist(err) {
		t.Fatalf("could not remove file: %v", err)
	}
}
