// src/ai/flows/personalized-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized service recommendations based on user data.
 *
 * - getPersonalizedRecommendations - A function that returns personalized service recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  userPreferences: z
    .string()
    .describe('A description of the user preferences and past activity.'),
  city: z.string().describe('The city for which to provide recommendations.'),
  serviceCategories: z
    .array(z.string())
    .describe('An array of available service categories.'),
});

export type PersonalizedRecommendationsInput = z.infer<
  typeof PersonalizedRecommendationsInputSchema
>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('An array of personalized service recommendations.'),
});

export type PersonalizedRecommendationsOutput = z.infer<
  typeof PersonalizedRecommendationsOutputSchema
>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI assistant that provides personalized service recommendations to users.

  Based on the user's preferences, past activity, city, and available service categories, recommend the most relevant services to the user.

  User Preferences: {{{userPreferences}}}
  City: {{{city}}}
  Available Service Categories: {{#each serviceCategories}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Recommendations:`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
