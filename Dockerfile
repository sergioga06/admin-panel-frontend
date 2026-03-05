# ... (etapas anteriores iguales)

# Etapa 3: Imagen de producción
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
# CAMBIO AQUÍ: Definimos el nuevo puerto para Next.js
ENV PORT 3033 

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
# CAMBIO AQUÍ: Exponemos el nuevo puerto
EXPOSE 3033 
CMD ["npm", "start"]