import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants' })
export class TenantEntity {
  // Define your entity properties and methods here

  /**
   * Primary key - UUID
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  subdomain: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  db_host: string;

  @Column({ type: 'int', nullable: false, default: 5432 })
  db_port: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  db_username: string;

  @Column({ type: 'text', nullable: false })
  db_password: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  db_name: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
