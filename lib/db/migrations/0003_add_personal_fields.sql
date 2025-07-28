-- Add new personal and relationship fields to family_contracts table
ALTER TABLE family_contracts 
ADD COLUMN user_first_name varchar(100),
ADD COLUMN partner_first_name varchar(100),
ADD COLUMN user_age integer,
ADD COLUMN partner_age integer,
ADD COLUMN cohab_date timestamp;