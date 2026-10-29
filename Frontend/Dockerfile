FROM node:24-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 5173
# The Vite dev server, same as "npm run dev"; --host lets the browser outside the container reach it
CMD ["npm", "run", "dev", "--", "--host"]
