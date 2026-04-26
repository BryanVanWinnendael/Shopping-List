package tests

import (
	"shopping-list/shared/tests/db"
	"shopping-list/shared/tests/files"
	"shopping-list/shared/tests/http"
)

// HTTP package

var SetupEcho = http.SetupEcho
var SetupMultipartEcho = http.SetupMultipartEcho

type MultipartFile = http.MultipartFile

var MockClientRequest = http.MockClientRequest
var MockJSONResponse = http.MockJSONResponse
var MockError = http.MockError

// DB package

var SetupDB = db.SetupDB
var Put = db.Put

// Files package

var SetupFile = files.SetupFile
var RemoveFile = files.RemoveFile
