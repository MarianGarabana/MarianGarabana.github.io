DROP DATABASE IF EXISTS cinema_chain;
CREATE DATABASE cinema_chain;
USE cinema_chain;

CREATE TABLE auditorium_type (
    Auditorium_Type_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(255),
    Price_Multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00
);

CREATE TABLE genre (
    Genre_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE showtime_group (
    Group_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE,
    Start_Range TIME NOT NULL,
    End_Range TIME NOT NULL
);

CREATE TABLE ticket_status (
    Status_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE product_category (
    Category_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE payment_method (
    Method_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE customer (
    Customer_ID INT PRIMARY KEY AUTO_INCREMENT,
    First_Name VARCHAR(50) NOT NULL,
    Last_Name VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(20),
    Registration_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE location (
    Location_ID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255) NOT NULL,
    City VARCHAR(50) NOT NULL,
    Zip_Code VARCHAR(20),
    Country VARCHAR(50) NOT NULL,
    Phone VARCHAR(20)
);

CREATE TABLE auditorium (
    Auditorium_ID INT PRIMARY KEY AUTO_INCREMENT,
    Location_ID INT NOT NULL,
    Auditorium_Type_ID INT NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Total_Seats INT NOT NULL,
    CONSTRAINT fk_auditorium_location FOREIGN KEY (Location_ID)
        REFERENCES location(Location_ID),
    CONSTRAINT fk_auditorium_type FOREIGN KEY (Auditorium_Type_ID)
        REFERENCES auditorium_type(Auditorium_Type_ID)
);

CREATE TABLE seat (
    Seat_ID INT PRIMARY KEY AUTO_INCREMENT,
    Auditorium_ID INT NOT NULL,
    Row_Code CHAR(2) NOT NULL,
    Seat_Number INT NOT NULL,
    Is_Accessible BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_seat_auditorium FOREIGN KEY (Auditorium_ID)
        REFERENCES auditorium(Auditorium_ID),
    CONSTRAINT unique_seat UNIQUE (Auditorium_ID, Row_Code, Seat_Number)
);

CREATE TABLE film (
    Film_ID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(150) NOT NULL,
    Duration_Minutes INT NOT NULL,
    Rating VARCHAR(10),
    Release_Date DATE,
    Licensing_Cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE film_genre (
    Film_ID INT NOT NULL,
    Genre_ID INT NOT NULL,
    PRIMARY KEY (Film_ID, Genre_ID),
    CONSTRAINT fk_filmgenre_film FOREIGN KEY (Film_ID)
        REFERENCES film(Film_ID),
    CONSTRAINT fk_filmgenre_genre FOREIGN KEY (Genre_ID)
        REFERENCES genre(Genre_ID)
);

CREATE TABLE showtime (
    Showtime_ID INT PRIMARY KEY AUTO_INCREMENT,
    Film_ID INT NOT NULL,
    Auditorium_ID INT NOT NULL,
    Showtime_Group_ID INT NOT NULL,
    Start_DateTime DATETIME NOT NULL,
    Ticket_Price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_showtime_film FOREIGN KEY (Film_ID)
        REFERENCES film(Film_ID),
    CONSTRAINT fk_showtime_auditorium FOREIGN KEY (Auditorium_ID)
        REFERENCES auditorium(Auditorium_ID),
    CONSTRAINT fk_showtime_group FOREIGN KEY (Showtime_Group_ID)
        REFERENCES showtime_group(Group_ID)
);

CREATE TABLE movie_ticket (
    Movie_Ticket_ID INT PRIMARY KEY AUTO_INCREMENT,
    Customer_ID INT NOT NULL,
    Showtime_ID INT NOT NULL,
    Seat_ID INT NOT NULL,
    Location_ID INT NOT NULL,
    Purchase_DateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_Method_ID INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Tax_Amount DECIMAL(10,2) NOT NULL,
    Total_Amount DECIMAL(10,2) NOT NULL,
    Status_ID INT NOT NULL,
    CONSTRAINT fk_ticket_customer FOREIGN KEY (Customer_ID)
        REFERENCES customer(Customer_ID),
    CONSTRAINT fk_ticket_showtime FOREIGN KEY (Showtime_ID)
        REFERENCES showtime(Showtime_ID),
    CONSTRAINT fk_ticket_seat FOREIGN KEY (Seat_ID)
        REFERENCES seat(Seat_ID),
    CONSTRAINT fk_ticket_location FOREIGN KEY (Location_ID)
        REFERENCES location(Location_ID),
    CONSTRAINT fk_ticket_payment FOREIGN KEY (Payment_Method_ID)
        REFERENCES payment_method(Method_ID),
    CONSTRAINT fk_ticket_status FOREIGN KEY (Status_ID)
        REFERENCES ticket_status(Status_ID)
);

CREATE TABLE product (
    Product_ID INT PRIMARY KEY AUTO_INCREMENT,
    Category_ID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Sub_Type VARCHAR(50),
    Size VARCHAR(20),
    Unit_Cost DECIMAL(10,2) NOT NULL,
    Sales_Price DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_product_category FOREIGN KEY (Category_ID)
        REFERENCES product_category(Category_ID)
);

CREATE TABLE shop_ticket (
    Shop_Ticket_ID INT PRIMARY KEY AUTO_INCREMENT,
    Location_ID INT NOT NULL,
    Customer_ID INT NULL,
    Purchase_DateTime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_Method_ID INT NOT NULL,
    Total_Product DECIMAL(10,2) NOT NULL,
    Total_Tax DECIMAL(10,2) NOT NULL,
    Total_Order DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_shop_location FOREIGN KEY (Location_ID)
        REFERENCES location(Location_ID),
    CONSTRAINT fk_shop_customer FOREIGN KEY (Customer_ID)
        REFERENCES customer(Customer_ID),
    CONSTRAINT fk_shop_payment FOREIGN KEY (Payment_Method_ID)
        REFERENCES payment_method(Method_ID)
);

CREATE TABLE shop_item (
    Shop_Ticket_ID INT NOT NULL,
    NumSeq INT NOT NULL,
    Product_ID INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Tax_Amount DECIMAL(10,2) NOT NULL,
    Line_Total DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (Shop_Ticket_ID, NumSeq),
    CONSTRAINT fk_item_ticket FOREIGN KEY (Shop_Ticket_ID)
        REFERENCES shop_ticket(Shop_Ticket_ID),
    CONSTRAINT fk_item_product FOREIGN KEY (Product_ID)
        REFERENCES product(Product_ID)
);
