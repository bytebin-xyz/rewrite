import { AxiosError } from "axios";

import { Context } from "@nuxt/types";

import "@nuxtjs/axios";

export interface ErrorInterface {
  error?: string;
  message: string | string[];
  statusCode: number;
}

export default ({ $axios }: Context) => {
  $axios.onError((error: AxiosError<ErrorInterface>) => {
    if (error.response) {
      // log error

      const { message, statusCode } = error.response.data;

      if (statusCode >= 500) {
        throw new Error("An error has occured, please try again later!");
      }

      if (Array.isArray(message)) {
        // eslint-disable-next-line unicorn/prefer-type-error
        throw new Error(message.join("\n"));
      }

      throw new Error(message);
    }

    throw error;
  });
};
