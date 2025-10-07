# LangSmith Observability Setup

This document describes how to set up LangSmith observability for all LLM calls in the Melodia application.

## Overview

LangSmith provides comprehensive observability for LLM applications, allowing you to monitor, debug, and optimize your interactions with Vertex AI models. This setup includes:

- Automatic tracing of all Vertex AI LLM calls
- Performance monitoring and metrics
- Error tracking and debugging
- Request/response logging
- User and request correlation

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# LangSmith Observability Configuration
LANGSMITH_TRACING=true
LANGSMITH_API_KEY="your-langsmith-api-key"
LANGSMITH_PROJECT="melodia-llm-observability"
LANGSMITH_ENDPOINT="https://api.smith.langchain.com"
```

### Environment Variable Descriptions

- `LANGSMITH_TRACING`: Set to `true` to enable tracing (default: `false`)
- `LANGSMITH_API_KEY`: Your LangSmith API key (required for tracing)
- `LANGSMITH_PROJECT`: Project name in LangSmith dashboard (default: `melodia-llm-observability`)
- `LANGSMITH_ENDPOINT`: LangSmith API endpoint (default: `https://api.smith.langchain.com`)

## Getting Your LangSmith API Key

1. Sign up for a LangSmith account at [smith.langchain.com](https://smith.langchain.com)
2. Navigate to the settings page
3. Generate an API key
4. Add the API key to your environment variables

## What Gets Traced

The observability setup automatically traces:

### Lyrics Generation
- Model: Gemini 2.5 Flash
- Input: System prompt, user prompt, form data
- Parameters: Temperature, max output tokens, JSON mode
- Output: Generated lyrics, title, music style
- Metadata: Processing time, success/failure, request ID, user ID

### Lyrics Refinement
- Model: Gemini 2.5 Flash
- Input: Current lyrics, refinement text, song request data
- Parameters: Temperature, max output tokens
- Output: Refined lyrics
- Metadata: Processing time, success/failure, request ID, user ID

## Viewing Traces

1. Log into your LangSmith dashboard
2. Navigate to the "melodia-llm-observability" project
3. View traces in real-time as they are generated
4. Filter by operation type, user, or time range
5. Analyze performance metrics and error rates

## Features

### Automatic Error Tracking
- All failed LLM calls are automatically traced with error details
- Error messages and stack traces are captured
- Processing time is recorded even for failed requests

### Performance Monitoring
- Processing time for each LLM call
- Token usage (when available)
- Success/failure rates
- Model performance metrics

### Request Correlation
- Each trace includes request ID and user ID
- Easy correlation between user actions and LLM calls
- Support for anonymous users

### Privacy and Security
- Sensitive data is not logged in traces
- Only metadata and structured data is captured
- API keys and credentials are never logged

## Disabling Observability

To disable observability:

1. Set `LANGSMITH_TRACING=false` in your environment variables
2. Or remove the `LANGSMITH_API_KEY` environment variable
3. The application will continue to work normally without tracing

## Troubleshooting

### Common Issues

1. **Traces not appearing**: Check that `LANGSMITH_API_KEY` is set correctly
2. **Permission errors**: Ensure your API key has the correct permissions
3. **Network issues**: Verify that `LANGSMITH_ENDPOINT` is accessible

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=langsmith:*
```

## Cost Considerations

- LangSmith offers a free tier with limited traces
- Monitor your usage in the LangSmith dashboard
- Consider upgrading your plan for production use

## Integration Points

The observability setup is integrated into:

- `src/lib/services/llm/llm-lyrics-opearation.ts` - Main LLM service
- `src/lib/lyrics-actions.ts` - Server actions for lyrics operations
- `src/app/api/generate-lyrics/route.ts` - API endpoint

## Future Enhancements

Potential future improvements:

- Custom metrics and alerts
- A/B testing support
- Cost tracking and optimization
- Advanced filtering and search
- Integration with other observability tools
