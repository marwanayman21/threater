using Swashbuckle.AspNetCore.Swagger;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Theater_booking.Data;
using Theater_booking.Services;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel to listen on all IPs, port 5000
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000);
});

// Add DbContext with SQL Server connection string from configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// قراءة الـ JWT settings
var jwtSettings = builder.Configuration.GetSection("Jwt");
var jwtSecret = jwtSettings["Secret"] 
    ?? throw new InvalidOperationException("JWT Secret is missing in configuration");

var key = Encoding.ASCII.GetBytes(jwtSecret);

// إعداد JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true
    };
});

builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // بدل الـ domain الحالي
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});






builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Theater Booking API", Version = "v1" });
});

// Services registration
builder.Services.AddSingleton<OTPService>();
builder.Services.AddMemoryCache();
builder.Services.AddScoped<OTPService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddHostedService<Timeout>();

var app = builder.Build();

app.UseCors("AllowFrontend"); // يجب أن يكون قبل Authentication و Authorization

// Always enable swagger (dev + production)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Theater Booking API V1");
});

app.UseAuthentication();
app.UseAuthorization();

// Migration + Initialization - Run once on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();  // إنشاء أو تحديث قاعدة البيانات
        DbInitializer.Initialize(context); // هنا تضع أي تهيئة للبيانات إن وجدت
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or initializing the database.");
        throw; // ممكن تبطل تشغيل التطبيق لو الفشل خطير
    }
}

app.MapControllers();

app.Run();
