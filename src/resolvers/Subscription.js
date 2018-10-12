const Subscription = {
  posts: {
    subscribe: (parent, args, ctx, info) => {
      return ctx.db.subscription.post(
        {
          where: {
            mutation_in: ['CREATED', 'UPDATED', 'DELETED']
          }
        },
        info
      )
    }
  }
}

module.exports = { Subscription }
