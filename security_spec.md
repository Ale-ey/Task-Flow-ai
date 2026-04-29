# Firebase Security Specification

## Data Invariants
1. A user can only access their own profile.
2. A todo item must belong to the logged-in user.
3. Todo IDs must be alphanumeric and under 128 characters.
4. Todo category must be one of: 'personal', 'work', 'shopping', 'health', 'urgent'.
5. User IDs and Todo IDs are immutable after creation.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Creating a user document with a UID that doesn't match `request.auth.uid`.
2. **Access Breach**: Reading `/users/attacker-uid/todos` as `legit-user`.
3. **Ghost Field Injection**: Adding an `isAdmin` field to a todo item.
4. **ID Poisoning**: Using a 2KB string as a Todo ID.
5. **Relation Breaking**: Setting `userId` of a todo item to someone else's UID.
6. **Timeline Tampering**: Updating `createdAt` of an existing todo.
7. **Type Mismatch**: Setting `completed` to a string "true".
8. **Enum Violation**: Setting `category` to "hacker".
9. **Size Abuse**: Sending a todo text string larger than 1000 characters.
10. **State Shortcut**: Attempting to update `userId` during a `completed` toggle.
11. **Shadow Creation**: Creating a todo without the required `createdAt` field.
12. **Blind List**: Querying todos without filtering by `userId` (the rules enforce this via `isOwner`).
