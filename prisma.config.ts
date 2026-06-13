export default {
  earlyAccess: true,
  schema: {
    kind: 'single',
    filePath: 'prisma/schema.prisma',
  },
  studio: {
    port: 5555,
  },
  migrate: {
    connection: {
      url: 'file:./dev.db',
    },
  },
}
