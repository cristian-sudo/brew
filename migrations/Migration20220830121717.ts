import { Migration } from '@mikro-orm/migrations';

export class Migration20220830121717 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `csv` (`id` int unsigned not null auto_increment primary key, `path` varchar(255) not null, `time_stamp` datetime not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `deal_status` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `refresh_token` (`id` int unsigned not null auto_increment primary key, `identifier` varchar(255) not null, `refresh_token` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `user_status` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null) default character set utf8mb4 engine = InnoDB;');

    this.addSql('create table `user` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null, `password` varchar(255) not null, `first_name` varchar(255) not null, `last_name` varchar(255) not null, `status_id` int unsigned not null, `roles` text not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `user` add unique `user_email_unique`(`email`);');
    this.addSql('alter table `user` add index `user_status_id_index`(`status_id`);');

    this.addSql('create table `password_reset` (`id` int unsigned not null auto_increment primary key, `reset_link` varchar(255) not null, `time_stamp` varchar(255) not null, `user_id` int unsigned not null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `password_reset` add unique `password_reset_user_id_unique`(`user_id`);');

    this.addSql('create table `deal` (`id` int unsigned not null auto_increment primary key, `name` varchar(255) not null, `description` varchar(255) not null, `deal_condition` varchar(255) not null, `price` int not null, `updated_at` timestamp not null, `status_id` int unsigned not null, `user_id` int unsigned not null, `buyer_id` int unsigned null) default character set utf8mb4 engine = InnoDB;');
    this.addSql('alter table `deal` add index `deal_status_id_index`(`status_id`);');
    this.addSql('alter table `deal` add index `deal_user_id_index`(`user_id`);');
    this.addSql('alter table `deal` add index `deal_buyer_id_index`(`buyer_id`);');

    this.addSql('alter table `user` add constraint `user_status_id_foreign` foreign key (`status_id`) references `user_status` (`id`) on update cascade;');

    this.addSql('alter table `password_reset` add constraint `password_reset_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;');

    this.addSql('alter table `deal` add constraint `deal_status_id_foreign` foreign key (`status_id`) references `deal_status` (`id`) on update cascade;');
    this.addSql('alter table `deal` add constraint `deal_user_id_foreign` foreign key (`user_id`) references `user` (`id`) on update cascade;');
    this.addSql('alter table `deal` add constraint `deal_buyer_id_foreign` foreign key (`buyer_id`) references `user` (`id`) on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table `deal` drop foreign key `deal_status_id_foreign`;');

    this.addSql('alter table `user` drop foreign key `user_status_id_foreign`;');

    this.addSql('alter table `password_reset` drop foreign key `password_reset_user_id_foreign`;');

    this.addSql('alter table `deal` drop foreign key `deal_user_id_foreign`;');

    this.addSql('alter table `deal` drop foreign key `deal_buyer_id_foreign`;');

    this.addSql('drop table if exists `csv`;');

    this.addSql('drop table if exists `deal_status`;');

    this.addSql('drop table if exists `refresh_token`;');

    this.addSql('drop table if exists `user_status`;');

    this.addSql('drop table if exists `user`;');

    this.addSql('drop table if exists `password_reset`;');

    this.addSql('drop table if exists `deal`;');
  }

}
