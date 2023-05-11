export function generateRandomInvalidEmail(): string {
  const invalidEmails = [
    'invalid-email',
    'no@domain',
    'missing-at.com',
    'spaces in email@example.com',
    'double..dots@example.com',
    'email@-example.com',
    'email@example-.com',
    'email@.example.com',
    'email@111.222.333.44444',
    'email@example',
    'email@.com',
    '@example.com',
    'email@example..com',
    'email@example_com',
    'email@example+com',
    'email@example,com',
    'email@example..com.',
    'email@example.123',
    'email@[123.123.123.123]',
  ]

  const randomIndex = Math.floor(Math.random() * invalidEmails.length)
  return invalidEmails[randomIndex]
}
