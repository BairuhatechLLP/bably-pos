import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // Register the dynamic module with database connections
  const AppModuleWithDB = await AppModule.register();

  const app = await NestFactory.create(AppModuleWithDB);

  // Enable global validation pipe for DTO validation and transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable automatic type transformation
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: false, // Don't throw error for extra properties
    }),
  );

  // Enable CORS for your report app
  app.enableCors({
    origin: '*', // Change this to your report app URL in production
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
