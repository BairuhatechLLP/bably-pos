import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
    const options = new DocumentBuilder()
        .setTitle('Blaby Westfield POS Server Apis')
        .setDescription('TaxGo Api Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .setBasePath('v2')
        .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('apis', app, document);
}
