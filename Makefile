.PHONY: build dev start clean install

# Install dependencies
install:
	npm install

# Build the TypeScript project
build:
	npm run build

# Start the development server with hot reloading
dev:
	npm run dev

# Start the production server
start:
	npm run start

# Clean build artifacts
clean:
	rm -rf dist

# Full development setup (install, build, and start dev server)
setup: install build dev

# Default target
all: build 