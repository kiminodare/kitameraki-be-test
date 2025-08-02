export const config = {
    cosmos: {
        connectionString: process.env.CosmosDbConnection ?? '',
        databaseId: 'TaskApp',
        containerId: 'Tasks'
    }
};