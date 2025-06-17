using Microsoft.AspNetCore.Identity;
using Theater_booking.Data;
using Theater_booking.Models;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        if (context.Seats.Any() || context.Shows.Any() || context.Users.Any()) return;
        
        var shows = new List<Show>
        {
           new Show { Day = "ثاني أيام عيد الأضحى الساعة 8 مساءً" },
            new Show { Day = "ثالث أيام عيد الأضحى الساعة 8 مساءً" },
            new Show {  Day = "رابع أيام عيد الأضحى الساعة 8 مساءً" }
        };
        
        context.Shows.AddRange(shows);
        
        var shows2 = new List<Show2>
        {
            new Show2 { Day = "الخميس 6/26 الساعة 10 مساءً" },
            new Show2 { Day = "الجمعة 6/27 الساعة 10 مساءً" }
        };

        context.Shows2.AddRange(shows2);

        var seats = new List<Seat>();

        // Upper Section - Rows with Left, Center, Right counts
        var upperLayout = new Dictionary<string, (int left, int center, int right)>
        {
            { "Z", (10, 0, 12) }, { "Y", (10, 0, 12) }, { "X", (10, 12, 12) }, { "W", (11, 11, 12) },
            { "V", (10, 10, 11) }, { "U", (6, 10, 7) }
        };

        foreach (var row in upperLayout)
        {
            int seatNumber = 1;
            // Left seats
            for (int i = 0; i < row.Value.left; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Left",
                    Price = 350,
                    Section = "Upper",
                });
            }
            // Center seats
            for (int i = 0; i < row.Value.center; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Center",
                    Price = 350,
                    Section = "Upper",
                });
            }
            // Right seats
            for (int i = 0; i < row.Value.right; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Right",
                    Price = 350,
                    Section = "Upper",
                });
            }
        }

        // Ground1 Section
        var ground1Layout = new Dictionary<string, (int left, int center, int right)>
        {
            { "T", (8, 15, 8) }, { "S", (8, 14, 8) },
            { "R", (8, 14, 8) }, { "Q", (7, 13, 7) }
            
        };

        foreach (var row in ground1Layout)
        {
            int seatNumber = 1;
            for (int i = 0; i < row.Value.left; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Left",
                    Price = 500,
                    Section = "Ground1",
                });
            }
            for (int i = 0; i < row.Value.center; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Center",
                    Price = 500,
                    Section = "Ground1",
                });
            }
            for (int i = 0; i < row.Value.right; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Right",
                    Price = 500,
                    Section = "Ground1",
                });
            }
        }

        // Ground2 Section
        var ground2Layout = new Dictionary<string, (int left, int center, int right)>
        {
            { "O", (0, 0, 11) }, { "N", (9, 0, 11) }, { "M", (9, 12, 10) }, { "L", (9, 13, 10) },
            { "K", (8, 12, 10) }, { "J", (8, 13, 9) }, { "I", (8, 12, 8) },
            { "H", (7, 13, 8) }, { "G", (7, 12, 7) }, { "F", (6, 13, 7) }, { "E", (5, 0, 6) },
            { "D", (5, 12, 5) }, { "C", (5, 13, 5) }, { "B", (4, 12, 4) }, { "A", (4, 13, 3) }
        };

        foreach (var row in ground2Layout)
        {
            int seatNumber = 1;
            for (int i = 0; i < row.Value.left; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Left",
                    Price = 650,
                    Section = "Ground2",
                });
            }
            for (int i = 0; i < row.Value.center; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Center",
                    Price = 650,
                    Section = "Ground2",
                });
            }
            for (int i = 0; i < row.Value.right; i++, seatNumber++)
            {
                seats.Add(new Seat
                {
                    Row = row.Key,
                    Number = seatNumber,
                    Position = "Right",
                    Price = 650,
                    Section = "Ground2",
                });
            }
        }

        context.Seats.AddRange(seats);


        var hasher = new PasswordHasher<User>();
        var users = new User[]
        {
            new User
            {
                FirstName = "Seif",
                LastName = "Tamer",
                Email = "Seif2004t@gmail.com",
                PasswordHash = hasher.HashPassword(null, "$eifTamer2004")
            },
            new User{
                FirstName = "Marwan",
                LastName = "Ayman",
                Email = "amarwan392@gmail.com",
                PasswordHash = hasher.HashPassword(null, "Marwan.123")
            },
            new User
            {
                FirstName = "khaled",
                LastName = "elcapitano",
                Email = "Adminkhaled@gmail.com",
                PasswordHash = hasher.HashPassword(null, "$Admin1980$V&GD")
            },
            new User{
                FirstName = "secuirity",
                LastName = "Guard",
                Email = "secuirityG220@gmail.com",
                PasswordHash = hasher.HashPassword(null, "$Guard1980$V&GD")
            }
        };
        context.Users.AddRange(users);
        var newSeats = new List<NewSeat>();

// Helper function to add a row
void AddRow(string row, int count, int price, string section, string position = "Center", int start = 1)
{
    for (int i = 0; i < count; i++)
    {
        newSeats.Add(new NewSeat
        {
            Row = row,
            Number = start + i,
            Price = price,
            Position = position,
            Section = section
        });
    }
}

// Zone 800: A, B, C
AddRow("A", 16, 800, "Main");
AddRow("B", 16, 800, "Main");
AddRow("C", 16, 800, "Main", "Center", 2); // Starts from 2

// Zone 650: D → J
AddRow("D", 14, 650, "Main");
AddRow("E", 14, 650, "Main");
AddRow("F", 14, 650, "Main");
AddRow("G", 14, 650, "Main");
AddRow("H", 14, 650, "Main");
AddRow("I", 14, 650, "Main");
AddRow("J", 15, 650, "Main", "Right"); // Right-positioned row

// Zone 500: K → U
AddRow("K", 20, 500, "Main");
AddRow("L", 20, 500, "Main");
AddRow("M", 22, 500, "Main");
AddRow("N", 22, 500, "Main");
AddRow("O", 22, 500, "Main");
AddRow("P", 22, 500, "Main");
AddRow("Q", 23, 500, "Main");
AddRow("R", 24, 500, "Main");
AddRow("S", 17, 500, "Main");
AddRow("T", 16, 500, "Main");
AddRow("U", 18, 500, "Main");

// Balcony - 350: B.A, B.B, B.C, B.D
AddRow("B.A", 20, 350, "Balcony");
AddRow("B.B", 20, 350, "Balcony");
AddRow("B.C", 22, 350, "Balcony");
AddRow("B.D", 22, 350, "Balcony");

// Balcony - 300: B.E → B.J
AddRow("B.E", 22, 300, "Balcony");
AddRow("B.F", 17, 300, "Balcony");
AddRow("B.G", 18, 300, "Balcony");
AddRow("B.H", 18, 300, "Balcony");
AddRow("B.I", 20, 300, "Balcony");
AddRow("B.J", 20, 300, "Balcony");

// Add to context
context.NewSeats.AddRange(newSeats);

        context.SaveChanges();
    }
}
