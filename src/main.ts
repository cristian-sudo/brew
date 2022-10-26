import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer, ValidationError } from 'class-validator';
import { NestExpressApplication } from '@nestjs/platform-express';
import AppModule from './app.module';
import ValidationException from './Exception/validation.exception';
import ValidationExceptionFilter from './ExceptionFilter/validation-exception.filter';

async function bootstrap() {
  const port: number = 3000;
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets('./Mailer/Partials');
  app.setBaseViewsDir('./Mailer/Partials');
  app.setViewEngine('hbs');

  const config = new DocumentBuilder()
    .setTitle('Intercambio Api')
    .setDescription('UI for our application')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        description: 'Default',
        type: 'http',
        in: 'header',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'defaultBearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/', app, document);

  // Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[] = []) => {
        const messages = errors.map(
          (error) => ({
            title: error.property,
            detail: `${error.property} has the wrong value of [ ${error.value} ]`,
            violations: Object.values(error.constraints ? error.constraints : []),
          }),
        );

        return new ValidationException(messages);
      },
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      whitelist: true,
    }),
  );

  // Set global filters
  app.useGlobalFilters(new ValidationExceptionFilter());

  // Class Validator DI
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // App Launch
  await app.listen(port);
}
bootstrap();
