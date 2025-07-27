-- Add contact information fields for both parties
ALTER TABLE family_contracts 
ADD COLUMN user_email VARCHAR(255),
ADD COLUMN user_phone VARCHAR(50),
ADD COLUMN user_address TEXT,
ADD COLUMN partner_email VARCHAR(255),
ADD COLUMN partner_phone VARCHAR(50),
ADD COLUMN partner_address TEXT;