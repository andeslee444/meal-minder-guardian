import { z } from 'zod';

// Inventory item validation schema
export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().nonnegative('Quantity must be 0 or greater'),
  unit: z.string().min(1, 'Unit is required'),
  purchaseDate: z.string().min(1, 'Purchase date is required'),
  expirationDate: z.string().min(1, 'Expiration date is required'),
  price: z.number().nonnegative('Price must be 0 or greater'),
  store: z.string().optional(),
  notes: z.string().optional(),
});

export type InventoryItem = z.infer<typeof inventoryItemSchema>;

// Recipe validation schema
export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().nonnegative().optional(),
        unit: z.string().optional(),
      })
    )
    .min(1, 'At least one ingredient is required'),
  instructions: z.array(z.string()).min(1, 'At least one instruction step is required'),
  prep_time: z.number().nonnegative().optional(),
  cook_time: z.number().nonnegative().optional(),
  servings: z.number().positive().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Recipe = z.infer<typeof recipeSchema>;

// User profile validation schema
export const userProfileSchema = z.object({
  id: z.string().uuid(), // Assuming Supabase provides a UUID
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  name: z.string().min(1, 'Full name is required').optional(),
  email: z.string().email('Invalid email address'),
  avatar_url: z.string().url().optional().nullable(),
  household: z.number().int().positive('Household size must be a positive number').optional(),
  preferences: z.record(z.any()).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

// Expense validation schema
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
  store: z.string().optional(),
  payment_method: z.string().optional(),
});

export type Expense = z.infer<typeof expenseSchema>;

// Helper function to validate data against a schema
export function validateData<T>(
  schema: z.ZodType<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
} {
  try {
    const validData = schema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error };
    }
    throw error;
  }
}

// Format validation errors into a user-friendly object
export function formatValidationErrors(errors?: z.ZodError): Record<string, string> {
  if (!errors) return {};

  const formattedErrors: Record<string, string> = {};

  errors.errors.forEach(error => {
    const path = error.path.join('.');
    formattedErrors[path] = error.message;
  });

  return formattedErrors;
}
