import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
  Logger,
} from "@medusajs/framework/types";
import { CreateEmailOptions, Resend } from "resend";
import { orderPlacedEmail } from "./emails/order-placed";
import { userInvitedEmail } from "./emails/user-invited";
import { passwordResetEmail } from "./emails/password-reset";
import { variantRestockEmail } from "./emails/variant-restock";

enum Templates {
  ORDER_PLACED = "order-placed",
  USER_INVITED = "user-invited",
  PASSWORD_RESET = "password-reset",
  VARIANT_RESTOCK = "variant-restock",
}

const templates: { [key in Templates]?: (props: unknown) => React.ReactNode } =
  {
    [Templates.ORDER_PLACED]: orderPlacedEmail,
    [Templates.USER_INVITED]: userInvitedEmail,
    [Templates.PASSWORD_RESET]: passwordResetEmail,
    [Templates.VARIANT_RESTOCK]: variantRestockEmail,
  };

type ResendOptions = {
  api_key: string;
  from: string;
  html_templates?: Record<
    string,
    {
      subject?: string;
      content: string;
    }
  >;
};

type InjectedDependencies = {
  logger: Logger;
};

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend";
  private resendClient: Resend;
  private options: ResendOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super();
    this.resendClient = new Resend(options.api_key);
    this.options = options;
    this.logger = logger;
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options.",
      );
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options.",
      );
    }
  }

  getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content;
    }
    const allowedTemplates = Object.keys(templates);

    if (!allowedTemplates.includes(template)) {
      return null;
    }

    return templates[template];
  }

  getTemplateSubject(template: Templates) {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject;
    }
    switch (template) {
      case Templates.ORDER_PLACED:
        return "Order Confirmation";
      case Templates.USER_INVITED:
        return "You're Invited!";
      case Templates.PASSWORD_RESET:
        return "Reset Your Password";
      case Templates.VARIANT_RESTOCK:
        return "Back in Stock";
      default:
        return "New Email";
    }
  }

  async send(
    notification: ProviderSendNotificationDTO,
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates);

    if (!template) {
      this.logger.error(
        `Couldn't find an email template for ${notification.template}. The valid options are ${Object.values(Templates)}`,
      );
      return {};
    }

    const commonOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
    };

    let emailOptions: CreateEmailOptions;
    if (typeof template === "string") {
      emailOptions = {
        ...commonOptions,
        html: template,
      };
    } else {
      emailOptions = {
        ...commonOptions,
        react: template(notification.data),
      };
    }

    try {
      this.logger.info(
        `[resend-provider] sending email template=${notification.template} to=${notification.to}`,
      );
      const { data, error } = await this.resendClient.emails.send(emailOptions);

      if (error || !data) {
        const errMsg = error
          ? error.message || JSON.stringify(error)
          : "unknown error";
        this.logger.error(
          `[resend-provider] failed delivery to=${notification.to} template=${notification.template} error=${errMsg}`,
        );
        return {};
      }

      this.logger.info(
        `[resend-provider] email sent successfully to=${notification.to} id=${data.id}`,
      );

      return { id: data.id };
    } catch (err) {
      this.logger.error(
        `[resend-provider] exception when sending to=${notification.to} template=${notification.template} error=${err instanceof Error ? err.message : String(err)}`,
      );
      return {};
    }
  }
}

export default ResendNotificationProviderService;
