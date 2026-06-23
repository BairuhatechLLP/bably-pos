import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { setupSwagger } from "./swagger";
import { AuthGuard } from "./shared/guard/auth.guard";
import { JwtService } from "@nestjs/jwt";
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(process.env.NAME);

  const jwtService = app.get(JwtService);
  const reflector = app.get(Reflector);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalGuards(new AuthGuard(jwtService, reflector));
  app.enableCors();
  app.setGlobalPrefix("v1");
  setupSwagger(app);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    next();
  });

  app.enableCors({
    allowedHeaders: "*",
    origin: "*",
  });

  await app.listen(process.env.PORT , () =>
    logger.log(
      `server is running on port ${process.env.PORT} `,
    ),
  );
}

bootstrap();
