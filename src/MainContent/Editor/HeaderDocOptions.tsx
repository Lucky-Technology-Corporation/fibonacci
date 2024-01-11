
export const docOptions: {title: string, description: string, type: string, image: string, import?: string, link?: string}[] = [
  {
    "type": "link",
    "image": "popout",
    "link": "https://docs.swizzle.co",
    "title": "Documentation",
    "description": "Open the docs in a new tab",
  },
  {
    "type": "doc",
    "image": "auth",
    "link": "https://docs.swizzle.co/users/create-a-user",
    "title": "Create a user",
    "import": "createUser",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let user = await createUser(optionalProperties, optionalRequestObject)</span><span class='hidden'>to create a new user santa</span>",
  },
  {
    "type": "doc",
    "image": "auth",
    "link": "https://docs.swizzle.co/users/get-a-user",
    "title": "Get a user",
    "import": "getUser",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let user = await getUser(userId)</span><span class='hidden'>to get a specific user details by id</span>"
  },
  {
    "type": "doc",
    "image": "auth",
    "link": "https://docs.swizzle.co/users/edit-a-user",
    "title": "Edit a user",
    "import": "editUser",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let user = await editUser(userId, properties)</span><span class='hidden'>to add properties and metadata to a user</span>"
  },
  {
    "type": "doc",
    "image": "auth",
    "link": "https://docs.swizzle.co/users/search-users",
    "title": "Search users",
    "import": "searchUsers",
    "description": "<span class='hidden'>Search, find, or get all users based on their properties or metadata with</span><span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let userArray = await searchUsers(queryObject)</span>"
  },
  {
    "type": "doc",
    "image": "auth",
    "link": "https://docs.swizzle.co/users/get-access-tokens",
    "title": "Get access tokens",
    "import": "signTokens",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let { accessToken, refreshToken } = await signTokens(userId, hoursToExpire)</span><span class='hidden'>to create new access tokens for a user</span>"
  },
  {
    "type": "doc",
    "image": "auth",
    "link": "https://docs.swizzle.co/users/refresh-access-tokens",
    "title": "Refresh access tokens",
    "import": "refreshTokens",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let { accessToken, refreshToken } = refreshTokens(refreshToken)</span><span class='hidden'>to create new access tokens for a user from a refresh token<span>"
  },
  {
    "type": "doc",
    "image": "files",
    "link": "https://docs.swizzle.co/storage/save-a-file",
    "title": "Save a file",
    "import": "saveFile",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let unsignedUrl = await saveFile(fileName, fileData, isPrivate, allowedUserIds[])</span><span class='hidden'>to upload a file to storage</span>"
  },
  {
    "type": "doc",
    "image": "files",
    "link": "https://docs.swizzle.co/storage/get-a-file-url",
    "title": "Get a file URL",
    "import": "getFileUrl",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let signedUrl = await getFileUrl(unsignedUrl)</span><span class='hidden'>to get a public URL for a private file in storage</span>"
  },
  {
    "type": "doc",
    "image": "files",
    "link": "https://docs.swizzle.co/storage/delete-a-file",
    "title": "Delete a file",
    "import": "deleteFile",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let success = await deleteFile(unsignedUrl)</span><span class='hidden'>to delete a file from storage</span>"
  },
  {
    "type": "doc",
    "image": "files",
    "link": "https://docs.swizzle.co/storage/add-user-to-file",
    "title": "Add user to a file",
    "import": "addUserToFile",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let success = await addUserToFile(unsignedUrl, uid)</span><span class='hidden'>to allow a user to access an unsigned URL in storage with their accessToken</span>"
  },
  {
    "type": "doc",
    "image": "files",
    "link": "https://docs.swizzle.co/storage/remove-user-from-file",
    "title": "Remove user from file",
    "import": "removeUserFromFile",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let success = await removeUserFromFile(unsignedUrl, uid)</span><span class='hidden'>to remove a user's access to an unsigned URL in storage</span>"
  },
  {
    "type": "doc",
    "image": "database",
    "link": "https://docs.swizzle.co/database",
    "title": "Search the database",
    "import": "db",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let results = await db.collection('myCollectionName').find({ myKey: 'myValue' }).toArray();</span><span class='hidden'>to search find documents a document item in a collection database</span>"
  },
  {
    "type": "doc",
    "image": "database",
    "link": "https://docs.swizzle.co/database",
    "title": "Update the database",
    "import": "db",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').updateOne({ myKeyToSearch: 'myValueToSearch' }, { $set: { myKeyToUpdate: 'myNewValue' } });</span><span class='hidden'>to updated change upsert modify values documents items in the database</span>"
  },
  {
    "type": "doc",
    "image": "database",
    "link": "https://docs.swizzle.co/database",
    "title": "Add to database",
    "import": "db",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').insertOne(jsonDocument);</span><span class='hidden'>to add insert items documents into database</span>"
  },
  {
    "type": "doc",
    "image": "database",
    "link": "https://docs.swizzle.co/database",
    "title": "Count in database",
    "import": "db",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').countDocuments({ myKeyToSearch: 'myValueToSearch' })</span><span class='hidden'>to count number of items documents in database</span>"
  },
  {
    "type": "doc",
    "image": "database",
    "link": "https://docs.swizzle.co/database",
    "title": "Delete from database",
    "import": "db",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>let result = await db.collection('myCollectionName').deleteOne({ myKeyToSearch: 'myValueToSearch' })</span><span class='hidden'>to delete remove item from the database</span>"
  },
]

export const frontendDocOptions = [
  {
    "type": "link",
    "image": "popout",
    "link": "https://docs.swizzle.co",
    "title": "Documentation",
    "description": "Open the documentation in a new tab",
  },
  {
    "type": "externalDoc",
    "image": "auth",
    "link": "https://docs.swizzle.co/frontend/users/sign-in",
    "title": "Sign In",
    "import": "useSignIn",
    "importFrom": "react-auth-kit",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const signIn = useSignIn()</span><span class='hidden'>to authenticate login signin sign in a user</span>"
  },
  {
    "type": "externalDoc",
    "image": "auth",
    "link": "https://docs.swizzle.co/frontend/users/sign-out",
    "title": "Sign Out",
    "import": "useSignOut",
    "importFrom": "react-auth-kit",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const signOut = useSignOut()</span><span class='hidden'>to logout signout log out sign out a user</span>"
  },
  {
    "type": "externalDoc",
    "image": "auth",
    "link": "https://docs.swizzle.co/frontend/users/check-auth-status",
    "title": "Check Login Status",
    "import": "useIsAuthenticated",
    "importFrom": "react-auth-kit",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const isAuthenticated = useIsAuthenticated()</span><span class='hidden'>to check if a user is logged in signed in authenticated auth status</span>"
  },
  {
    "type": "externalDoc",
    "image": "auth",
    "link": "https://docs.swizzle.co/frontend/users/get-user-data",
    "title": "Get User Data",
    "import": "useAuthUser",
    "importFrom": "react-auth-kit",
    "description": "<span class='font-mono cursor-pointer text-xs max-w-[400px] block overflow-hidden whitespace-nowrap text-ellipsis'>const auth = useAuthUser()</span><span class='hidden'>to get users uid userId id user data info</span>"
  },
]

export const swizzleActionOptions = [
  {
    "type": "action",
    "image": "save",      
    "title": "Save",
    "description": "Save changes to this file",
    "filter": ""
  },
  {
    "type": "action",
    "image": "wand",
    "title": "Autocheck",
    "description": "Run the error checker",
    "filter": ""
  },
  {
    "type": "action",
    "image": "box",
    "title": "Packages",
    "description": "Install NPM package",
    "filter": ""
  },
  {
    "type": "action",
    "image": "restart",
    "title": "Restart",
    "description": "Restart the server",
    "filter": ""
  },
  {
    "type": "action",
    "image": "lock",
    "title": "Secrets",
    "description": "Manage secret environment variables",
    "filter": "backend"
  },
  {
    "type": "action",
    "image": "auth",
    "title": "Switch Auth",
    "description": "Require/don't require authentication",
    "filter": "backend"
  },
]