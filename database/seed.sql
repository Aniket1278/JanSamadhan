-- Locations only. No representatives or statistics are seeded, so nothing here can be wrong or invented.
INSERT INTO locations(level,name) VALUES
('state','Andhra Pradesh'),('state','Arunachal Pradesh'),('state','Assam'),('state','Bihar'),('state','Chhattisgarh'),
('state','Goa'),('state','Gujarat'),('state','Haryana'),('state','Himachal Pradesh'),('state','Jharkhand'),
('state','Karnataka'),('state','Kerala'),('state','Madhya Pradesh'),('state','Maharashtra'),('state','Manipur'),
('state','Meghalaya'),('state','Mizoram'),('state','Nagaland'),('state','Odisha'),('state','Punjab'),
('state','Rajasthan'),('state','Sikkim'),('state','Tamil Nadu'),('state','Telangana'),('state','Tripura'),
('state','Uttar Pradesh'),('state','Uttarakhand'),('state','West Bengal'),
('state','Andaman and Nicobar Islands'),('state','Chandigarh'),('state','Dadra and Nagar Haveli and Daman and Diu'),
('state','Delhi'),('state','Jammu and Kashmir'),('state','Ladakh'),('state','Lakshadweep'),('state','Puducherry');

-- Start with Maharashtra districts; add other states the same way
INSERT INTO locations(parent_id,level,name)
SELECT (SELECT id FROM locations WHERE name='Maharashtra'), 'district', d FROM unnest(ARRAY[
'Ahilyanagar','Akola','Amravati','Beed','Bhandara','Buldhana','Chandrapur','Chhatrapati Sambhajinagar','Dharashiv','Dhule',
'Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded',
'Nandurbar','Nashik','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane',
'Wardha','Washim','Yavatmal']) AS d;
