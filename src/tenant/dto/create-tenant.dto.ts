import { IsInt, IsNotEmpty, IsString, Length, Matches, Max, Min } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain can only contain lowercase letters, numbers, and hyphens.',
  })
  subdomain: string;

  @IsString()
  @IsNotEmpty()
  db_host: string;

  @IsInt()
  @Min(1024)
  @Max(65535)
  @IsNotEmpty()
  db_port?: number = 5432;

  @IsString()
  @IsNotEmpty()
  db_username: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 100)
  db_password: string;

  @IsString()
  @IsNotEmpty()
  db_name: string;
}
