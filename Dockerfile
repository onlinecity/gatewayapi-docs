FROM python:2.7-jessie as builder
RUN apt update && apt install -y graphviz texlive-latex-base texlive-latex-extra texlive-fonts-recommended texlive-latex-recommended latexmk make
COPY requirements.txt .
RUN pip install -r requirements.txt

WORKDIR /workspace/

COPY docs .
RUN make html latexpdf

FROM nginx
COPY --from=builder --chown=nginx:nginx /workspace/_build/html /usr/share/nginx/html/docs
COPY --from=builder --chown=nginx:nginx /workspace/_build/latex/gatewayapi.pdf /usr/share/nginx/html/docs/gatewayapi.pdf
ENV NGINX_HOST gatewayapi.dev
ENV NGINX_PORT 80
EXPOSE 80
