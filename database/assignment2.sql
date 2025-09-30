--- Week 03 Assignment ---

--- Task 1 - Insert Mr. Stark
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com','Iam1ronm@n')

--- Task 2 - Modify Mr. Stark
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 4

--- TASK 3 - Delete poor Mr. Stark.
DELETE FROM account
WHERE account_id = 4

--- Task 4 - Modify the "GM Hummer" record (must use replace function)
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

--- TASK 5 -- Use an inner join to select all make/models(inv) and classification_name (classification) where the class name is Sport.
SELECT inventory.inv_make, inventory.inv_model, classification.classification_name
FROM inventory
INNER JOIN classification ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

---- Task 6 - Add /vehicles/ to the ends of /images inside of both the inv_image/inv_thumbnail UrlPaths.
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/')
	,inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');

