-- Fix existing users with 'USER' role to 'CUSTOMER'
-- This ensures all regular users can see the "Become a Partner" button

UPDATE "User" SET role = 'CUSTOMER' WHERE role = 'USER';

-- Update the default constraint for new users
ALTER TABLE "User" ALTER COLUMN role SET DEFAULT 'CUSTOMER';
