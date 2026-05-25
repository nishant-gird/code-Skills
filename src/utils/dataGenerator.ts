import { faker } from '@faker-js/faker';
import { IUserData, IContactFormData } from './types';

class DataGenerator {
  /**
   * Generate unique user data for registration/login
   */
  generateUserData(): IUserData {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const timestamp = Date.now();

    return {
      firstName,
      lastName,
      email: `qa_${timestamp}_${faker.internet.userName()}@automationexercise.com`,
      password: faker.internet.password({ length: 12, memorable: true }),
      title: faker.person.prefix(),
      companyName: faker.company.name(),
      address: faker.location.streetAddress(),
      country: faker.location.country(),
      state: faker.location.state(),
      city: faker.location.city(),
      zipCode: faker.location.zipCode(),
      mobileNumber: faker.phone.number('+1##########')
    };
  }

  /**
   * Generate test email address with timestamp
   */
  generateEmail(): string {
    const timestamp = Date.now();
    return `qa_${timestamp}_${faker.internet.userName()}@automationexercise.com`;
  }

  /**
   * Generate test password
   */
  generatePassword(): string {
    return faker.internet.password({ length: 12, memorable: true });
  }

  /**
   * Generate unique identifier using timestamp
   */
  generateUniqueId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Generate search term for product search
   */
  generateSearchTerm(): string {
    const terms = ['Blue', 'Red', 'Cotton', 'Shirt', 'Dress', 'Jean', 'Top', 'Bottom'];
    return terms[Math.floor(Math.random() * terms.length)];
  }

  /**
   * Generate contact form data
   */
  generateContactFormData(): IContactFormData {
    return {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      subject: faker.lorem.sentence(),
      message: faker.lorem.paragraphs(2)
    };
  }

  /**
   * Generate invalid email for negative testing
   */
  generateInvalidEmail(): string {
    return 'invalid-email-format';
  }

  /**
   * Generate weak password for negative testing
   */
  generateWeakPassword(): string {
    return '123';
  }
}

export const dataGenerator = new DataGenerator();
