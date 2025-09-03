# Ridelines Chainring

Chainring is the API backbone that powers [ridelines.xyz](https://ridelines.xyz). It provides type-safe tRPC endpoints for authentication, user management, and activity synchronization. Built for serverless deployment on AWS Lambda with comprehensive monitoring and observability.

### Key Features

- **🔒 Clerk Authentication**: Secure JWT-based authentication with Clerk integration
- **📡 tRPC v11**: Type-safe APIs with end-to-end TypeScript inference
- **👤 User Management**: DynamoDB-backed user profiles and state management
- **🔄 Activity Sync**: Integration with drivetrain Lambda for activity processing
- **🌐 intervals.icu OAuth**: OAuth 2.0 flow for intervals.icu data access
- **📊 Observability**: AWS Lambda Powertools for metrics, logging, and tracing
- **⚡ Serverless**: AWS Lambda deployment with optimal performance
- **🔐 Presigned URLs**: Secure S3 access for PMTiles delivery

## Technology Stack

- **Runtime**: AWS Lambda with Node.js 22
- **Framework**: tRPC v11 with TypeScript
- **Authentication**: Clerk with JWT validation
- **Database**: DynamoDB for user profiles and OAuth state
- **Build Tool**: tsdown for optimized Lambda bundles
- **Testing**: Node.js native test runner
- **Code Quality**: Biome for linting and formatting
- **Monitoring**: AWS Lambda Powertools (Logger, Metrics, Tracer)
- **HTTP Client**: openapi-fetch for intervals.icu integration

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- npm 10.x or higher
- AWS CLI configured with appropriate permissions
- Clerk account and application setup

### Development Setup

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd ridelines-chainring
   npm install
   ```

2. **Environment configuration**:
   Create a `.env` file (see `.env.example`):
   ```env
   # Clerk Configuration
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_WEBHOOK_SECRET=your_webhook_secret

   # AWS Configuration
   AWS_REGION=us-west-2
   USERS_TABLE_NAME=ridelines-users

   # intervals.icu Integration
   INTERVALS_CLIENT_ID=your_intervals_client_id
   INTERVALS_CLIENT_SECRET=your_intervals_client_secret

   # Sync Integration
   SYNC_LAMBDA_FUNCTION_NAME=ridelines-sync-lambda
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   The server runs on `http://localhost:3000`

4. **Type checking and linting**:
   ```bash
   npm run type-check  # TypeScript validation
   npm run lint        # Code linting
   npm run format      # Code formatting
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized Lambda bundle |
| `npm test` | Run test suite |
| `npm run type-check` | TypeScript type checking |
| `npm run lint` | Code linting with Biome |
| `npm run format` | Code formatting with Biome |
| `npm run check` | Full code quality check (type + lint) |

## Architecture

### Core Components

#### **Authentication Flow**
1. **Frontend Login**: User authenticates with Clerk
2. **JWT Validation**: Chainring validates JWT tokens
3. **User Creation**: First-time users created in DynamoDB
4. **intervals.icu OAuth**: Optional OAuth for data access
5. **Sync Trigger**: Authenticated users can trigger activity sync

#### **User Management**
- **Profile Storage**: DynamoDB table for user profiles
- **OAuth State**: Temporary storage for OAuth flows
- **Presigned URLs**: Secure access to user PMTiles files
- **Sync Status**: Track activity synchronization state

#### **Activity Sync Integration**
- **Lambda Invocation**: Async invocation of drivetrain sync Lambda
- **Status Tracking**: Monitor sync progress and results
- **Error Handling**: Graceful error propagation and retry logic

### Project Structure

```
chainring/
├── src/
│   ├── api/                   # tRPC API implementation
│   │   ├── index.ts          # Main router and Lambda handler
│   │   ├── middleware/       # Authentication and monitoring
│   │   └── procedures/       # API endpoint implementations
│   ├── clients/              # External service clients
│   │   ├── aws.ts           # AWS SDK configurations
│   │   ├── intervals.ts     # intervals.icu API client
│   │   └── monitoring.ts    # Observability utilities
│   ├── types/               # TypeScript type definitions
│   │   ├── context.ts       # tRPC context types
│   │   ├── env.ts           # Environment variable types
│   │   ├── lambda.ts        # AWS Lambda types
│   │   └── trpc.ts          # tRPC-specific types
│   ├── generated/           # Auto-generated types
│   │   └── intervals-types.ts # intervals.icu API types
│   ├── index.ts             # Lambda entry point
│   └── types.ts             # Shared type definitions
├── scripts/
│   └── dev-server.ts        # Development server
├── extern/                  # External API specifications
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsdown.config.ts         # Build configuration
├── biome.jsonc              # Code quality configuration
└── README.md                # This file
```

## API Endpoints

### intervals.icu Integration

- **`intervals.oauth.userInfo`** - Called by clerk to retrieve user claims after sign-in

### User Management

- **`user.pmtiles`** - Get a signed pmtiles url that is valid for 24 hrs

### Activity Sync

- **`sync`** - Get sync status

## Configuration

### Environment Variables

#### Required for All Environments
```bash
# Clerk Authentication
CLERK_SECRET_KEY=sk_...                    # Clerk secret key
CLERK_PUBLISHABLE_KEY=pk_...               # Clerk publishable key
CLERK_WEBHOOK_SECRET=whsec_...             # Webhook signature verification

# AWS Configuration
AWS_REGION=us-west-2                       # AWS deployment region
USERS_TABLE_NAME=ridelines-users           # DynamoDB table name

# intervals.icu Integration
INTERVALS_CLIENT_ID=your_client_id         # OAuth client ID
INTERVALS_CLIENT_SECRET=your_secret        # OAuth client secret

# Sync Integration
SYNC_LAMBDA_FUNCTION_NAME=ridelines-sync   # Sync Lambda function name
```

#### Optional Configuration
```bash
# Development
NODE_ENV=development                       # Environment mode
LOG_LEVEL=debug                            # Logging verbosity

# AWS Lambda Powertools
POWERTOOLS_SERVICE_NAME=chainring          # Service name for metrics
POWERTOOLS_METRICS_NAMESPACE=Ridelines     # CloudWatch metrics namespace
```

### Clerk Setup

1. **Create Clerk Application**: Set up application in Clerk dashboard
2. **Configure JWT Template**: Set up custom JWT template with user metadata
3. **Webhook Configuration**: Configure webhooks for user lifecycle events
4. **Environment Variables**: Add Clerk keys to environment configuration

### intervals.icu OAuth Setup

1. **Register OAuth App**: Create OAuth application in intervals.icu settings
2. **Configure Redirect URIs**: Set callback URLs for your environment
3. **Store Credentials**: Add client ID and secret to environment variables

## Deployment

### Build Process

1. **Type Generation**: intervals.icu types generated during `npm install`
2. **Lambda Bundle**: tsdown creates optimized bundle for AWS Lambda
3. **Container Packaging**: GitHub Actions packages for deployment
4. **Infrastructure Deploy**: Frame module deploys Lambda function

### GitHub Actions Workflow

- **Test**: Type checking, linting, and test execution
- **Build**: Lambda bundle creation with environment validation
- **Publish**: Container creation and deployment trigger

### Environment Configuration

#### Development
- Automatic deployment when chainring changes
- Development Clerk app configuration
- Debug logging enabled
- Hot reload for local development

#### Production
- Manual deployment approval required
- Production Clerk app configuration
- Optimized logging and metrics
- Blue/green deployment strategy

## Performance

### Optimization Features

- **Bundle Optimization**: tsdown creates minimal Lambda bundles
- **Cold Start Reduction**: Optimized imports and initialization
- **Connection Pooling**: Reused AWS SDK clients
- **Type Safety**: Compile-time validation prevents runtime errors
- **Async Operations**: Non-blocking I/O for better throughput

### Monitoring

#### CloudWatch Metrics
```javascript
// Emitted metrics
- chainring.auth.success (Count)
- chainring.auth.failure (Count)
- chainring.oauth.flow.duration (Duration)
- chainring.sync.trigger.count (Count)
- chainring.api.response.time (Duration)
```

#### Structured Logging
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "chainring",
  "userId": "user_123",
  "procedure": "user.getProfile",
  "duration": 145
}
```

## Testing

### Test Suite
```bash
# Run all tests
npm test

# Watch mode during development
npm run test -- --watch

# Coverage reporting
npm run test -- --coverage
```

### Test Categories

- **Unit Tests**: Individual procedure and utility testing
- **Integration Tests**: End-to-end API flow validation
- **Authentication Tests**: Clerk integration and JWT validation
- **OAuth Tests**: intervals.icu OAuth flow testing

## Development Features

### Hot Reload Development Server

The development server provides:
- Hot reload for code changes
- Local DynamoDB simulation
- Mock AWS services for testing
- Request/response logging
- Error stack traces

### Type Safety

- **End-to-End Types**: tRPC provides compile-time API validation
- **Generated Types**: Auto-generated intervals.icu API types
- **Strict TypeScript**: Zero-tolerance type checking
- **Runtime Validation**: Zod schemas for request/response validation

## Troubleshooting

### Common Issues

**JWT Validation Errors**: Check Clerk configuration and token format
```bash
# Debug JWT tokens
console.log(await clerkClient.users.getUser(userId))
```

**intervals.icu OAuth Issues**: Verify client ID/secret and redirect URIs
```bash
# Test OAuth configuration
curl -X POST "https://intervals.icu/oauth/token" \
  -d "client_id=$CLIENT_ID" \
  -d "client_secret=$CLIENT_SECRET"
```

**DynamoDB Connection Issues**: Check AWS credentials and table names
```bash
# Verify table access
aws dynamodb describe-table --table-name ridelines-users
```

**Sync Lambda Invocation**: Confirm function name and permissions
```bash
# Test Lambda invocation
aws lambda invoke --function-name ridelines-sync response.json
```

### Debug Mode

Enable verbose logging:
```bash
export LOG_LEVEL=debug
export NODE_ENV=development
npm run dev
```

## Contributing

### Development Workflow

1. Create feature branch from `main`
2. Implement changes with proper TypeScript types
3. Add tests for new functionality
4. Run `npm run check` for code quality
5. Test locally with development server
6. Submit PR with clear description

### Code Standards

- Use Biome for consistent formatting
- Follow tRPC patterns for API procedures
- Implement proper error handling
- Add comprehensive TypeScript types
- Write tests for new features
- Use semantic commit messages

### Architecture Guidelines

- Keep procedures focused and single-purpose
- Use middleware for cross-cutting concerns
- Implement proper input validation with Zod
- Follow AWS Lambda best practices
- Optimize for cold start performance

## Security

### Authentication Security
- JWT token validation on all protected endpoints
- Clerk webhook signature verification
- User session management and invalidation

### Data Security
- DynamoDB encryption at rest
- Secure environment variable management
- No sensitive data in logs or metrics

### API Security
- Input validation and sanitization
- Rate limiting (via AWS Lambda concurrency)
- CORS configuration for frontend integration

## License

MIT License - see LICENSE file for details.

## Related Projects

- **Frontend (Hub)**: [ridelines-hub](https://github.com/kreed/ridelines-hub)
- **Backend Workflow (Drivetrain)**: [ridelines-drivetrain](https://github.com/kreed/ridelines-drivetrain)
- **Infrastructure (Frame)**: [ridelines-frame](https://github.com/kreed/ridelines-frame)
- [tRPC](https://trpc.io/) - End-to-end typesafe APIs
- [Clerk](https://clerk.com/) - Authentication and user management
