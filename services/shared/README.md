# Shopping List - Shared

The **Shared** module contains all code that is reused across the backend microservices. It provides a single place for common contracts, models, utilities, middleware, and tooling, ensuring consistency throughout the project.

## Contracts

Contracts define the request and response structures used for communication between the mobile application and the backend services.

## Models

Models contain the shared domain entities used across the microservices. These models represent common business objects that are required by multiple services.

## Type Generation

The shared module includes a script inside ./tools/contractgen that automatically generates **TypeScript types** for the mobile application from the shared contracts and models.

This ensures the app always stays synchronized with the backend data structures and eliminates the need to manually maintain duplicate type definitions.

## Shared Utilities

The shared module also contains reusable utilities that can be used by every microservice, including:

* HTTP client
* Logging utilities
* HTTP middleware
* Test helper functions
* Test setup utilities
* Common helper functions
* Shared constants and configuration
* Other reusable components used across services