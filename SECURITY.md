# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| 1.4.x   | :white_check_mark: |
| < 1.4   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

### Responsible Disclosure

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **Do not** open a public issue
2. **Do not** discuss the vulnerability publicly
3. Email security details to: [security@example.com] (replace with actual email)
4. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if applicable)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Security Best Practices

#### For Users

- Keep your browser updated
- Use HTTPS when accessing the application
- Do not share sensitive information in public channels
- Report security issues responsibly

#### For Developers

- Follow secure coding practices
- Review dependencies regularly
- Keep dependencies updated
- Use environment variables for secrets
- Never commit secrets to version control

## Security Features

### Data Privacy

- **No PII Collection**: No personally identifiable information is collected
- **Privacy-Safe Telemetry**: Only aggregate metrics, no raw queries or coordinates
- **Client-Side Processing**: Sensitive operations performed client-side when possible

### Authentication & Authorization

- **No Authentication Required**: Public access (for MVP)
- **API Rate Limiting**: Implemented to prevent abuse
- **Input Validation**: All inputs validated and sanitized

### Data Protection

- **HTTPS Only**: All connections use HTTPS
- **Secure Headers**: Security headers configured
- **Content Security Policy**: CSP headers enabled

## Known Security Considerations

### Current Limitations

- **Public Access**: No authentication required (by design for MVP)
- **Rate Limiting**: Basic rate limiting in place
- **Input Validation**: Client and server-side validation

### Future Enhancements

- Enhanced rate limiting
- API key authentication (optional)
- Audit logging
- Security monitoring

## Security Updates

Security updates will be released as:
- **Patch Releases**: For critical security fixes (e.g., v1.5.1)
- **Minor Releases**: For security enhancements (e.g., v1.6.0)

## Acknowledgments

We thank security researchers who responsibly disclose vulnerabilities.

## Related

- [SUPPORT.md](SUPPORT.md) - Support resources
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) - Third-party software

