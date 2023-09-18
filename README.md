# serverless-plugin-log-key-id

This plugin adds an `KmsKeyId` to `AWS::Logs::LogGroup` for each of your Lambda functions.

## Configuration

Configuration happens both 'globally' (via custom.logsKmsArn) and also at the function level (via function.yourFunction.logsKmsArn). The property takes a string argument which is an ARN of the KMS key.

### Examples

The most basic:

```yml
custom:
  logsKmsArn: 'some-arn'
```

Custom function settings:

```yml
functions:
  myFunction:
    logsKmsArn: 'some-arn'
```
