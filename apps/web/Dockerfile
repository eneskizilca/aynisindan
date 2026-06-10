FROM node:20-alpine

# Set build-time environment variables for Next.js static compilation
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CATALOG_API_URL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CATALOG_API_URL=$NEXT_PUBLIC_CATALOG_API_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Compile production build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]