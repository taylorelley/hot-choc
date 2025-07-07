# Build stage
FROM node:20 AS build
WORKDIR /app

# Allow configuring the API URL at build time so client components
# have the correct endpoint baked in when the app is built.
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npx next build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app .
EXPOSE 3000
CMD ["npx", "next", "start"]
