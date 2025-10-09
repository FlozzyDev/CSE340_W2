
-- If we need to add the jeep back
INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
VALUES ('Jeep', 'Wrangler', '2019', 'The Jeep Wrangler is small and compact with enough power to get you where you want to go. Its great for everyday driving as well as offroading weather that be on the the rocks or in the mud!', '/images/vehicles/wrangler.jpg', '/images/vehicles/wrangler-tn.jpg', 28045, 41205, 'Yellow', 3);

-- If we need to delete the jeep again to test that "classification" displays, but we tell the user we are out of stock for that type. 
DELETE FROM inventory WHERE classification_id = 3