// import "./instrumentation.js"
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger } from "./core/logger/logger.service.js";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useLogger(app.get(Logger));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        })
    );
      const config = new DocumentBuilder()
          .setTitle("DIO")
          .setDescription("workflow automation tool")
          .setVersion("1.0")
          .build();
      const documentFactory = () => SwaggerModule.createDocument(app, config);
      SwaggerModule.setup("swagger", app, documentFactory);


    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
