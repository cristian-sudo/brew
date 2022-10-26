import * as _ from 'lodash';

const MAX_DEPTH = 15;
const EXTENSION = '.json';

export default class JsonSchemaLoader {
  public getSchemaByName = async (
    directory: string,
    fileName: string,
  ): Promise<Record<string, unknown>> => {
    const jsonSchema = _.omit(await import(`./${directory}/${fileName}${EXTENSION}`), 'default');

    return JSON.parse(await this.merge(JSON.stringify(jsonSchema))) as Record<string, unknown>;
  };

  private merge = async (jsonSchema: string): Promise<string> => {
    let schema = jsonSchema;
    let depth: number = MAX_DEPTH;
    const refRegex = /{.?"\$ref":"\/.+?"}/g;
    const fileRegex = /\/(.+)"/m;

    while (schema.includes('$ref')) {
      const propertiesFiles = refRegex.exec(schema) || [];
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      propertiesFiles.map(async (propertyFile) => {
        const fileNameRegex = fileRegex.exec(propertyFile);

        if (fileNameRegex !== null) {
          const fileName = fileNameRegex[1];
          const mergeJson = _.omit(await import(fileName + EXTENSION), 'default');
          schema = schema.replace(propertyFile, JSON.stringify(mergeJson));
        }
      });

      depth -= 1;

      if (depth <= 0) {
        break;
      }
    }

    return schema;
  };
}
