# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC values are embedded into the browser bundle during `next build`.
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_RP_baseurl
ARG NEXT_PUBLIC_BASE_URL_TS_PROD
ARG NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
ARG NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY
ARG NEXT_PUBLIC_FLUTTERWAVE_TEST_PUBLIC_KEY

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_RP_baseurl=$NEXT_PUBLIC_RP_baseurl \
    NEXT_PUBLIC_BASE_URL_TS_PROD=$NEXT_PUBLIC_BASE_URL_TS_PROD \
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY \
    NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY=$NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY \
    NEXT_PUBLIC_FLUTTERWAVE_TEST_PUBLIC_KEY=$NEXT_PUBLIC_FLUTTERWAVE_TEST_PUBLIC_KEY

RUN yarn build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

# Shell expansion is required for Railway's runtime-provided PORT.
CMD ["sh", "-c", "exec yarn start --hostname 0.0.0.0 --port ${PORT:-3000}"]
