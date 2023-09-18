'use strict';

module.exports = class LogKeyIdPlugin {
  constructor(serverless) {
    this.provider = serverless.getProvider('aws');
    this.serverless = serverless;
    this.hooks = {
      'aws:package:finalize:mergeCustomProviderResources': () => this.addLogKmsKeyId(),
    };

    serverless.configSchemaHandler.defineFunctionProperties('aws', {
      properties: {
        logsKmsArn: { type: 'string' },
      },
    });
  }

  async addLogKmsKeyId() {
    const service = this.serverless.service;
    const functions = service.functions;

    if (functions) {
      const custom = service.custom || {};
      const kmsKeyId = custom.logsKmsArn || {};

      if (!Array.isArray(kmsKeyId)) {
        this.addLambdaKmsKeyId(service, functions, kmsKeyId);
      } else {
        for (const index in kmsKeyId) {
          this.addLambdaKmsKeyId(service, functions, kmsKeyId[index], index);
        }
      }
    }
  }

  addLambdaKmsKeyId(service, functions, kmsKeyId) {
    const aws = this.provider;
    const template = service.provider.compiledCloudFormationTemplate;

    template.Resources = template.Resources || {};

    Object.keys(functions).forEach(functionName => {
      const fn = functions[functionName];
      const keyArn = this.getConfig(kmsKeyId, fn);

      if (!keyArn) {
        return;
      }

      const normalizedFunctionName = aws.naming.getNormalizedFunctionName(functionName);
      const logGroupLogicalId = `${normalizedFunctionName}LogGroup`;

      template.Resources[logGroupLogicalId].Properties.KmsKeyId = keyArn;
    });
  }

  getConfig(common, fn) {
    if (typeof fn === 'undefined' || fn.logsKmsArn === undefined) {
      return common;
    }

    return fn.logsKmsArn;
  }
};
