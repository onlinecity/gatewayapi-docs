GatewayAPI Documentation
========================

This documentation is available online at https://gatewayapi.com/docs/

Writing and improving our documentation is an ongoing effort. Pull requests,
comments etc are welcome.


# Build

Cloudbuilder does not take .git folder into the workspace, which is need for submodules.

To build run following commnad:
```gcloud builds submit --config=cloudbuild.yaml --substitutions=BRANCH_NAME="container" .```
