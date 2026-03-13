import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is missing from environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'unconfigured');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateVocabulary(title: string, description: string): Promise<any[]> {
    const prompt = `Generate 5-10 vocabulary words for the lesson topic "${title}". Context: "${description || ''}". Return ONLY a raw JSON array of objects with the following schema: [{term, definition, phonetic, example}]. Do not include markdown code blocks or any other surrounding text.`;

    try {
      const result = await this.model.generateContent(prompt);
      const output = result.response.text();
      // Clean up markdown code blocks if the AI accidentally includes them
      const cleanOutput = output
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      return JSON.parse(cleanOutput);
    } catch (error) {
      console.error('Error generating vocabulary from Gemini:', error);
      throw new InternalServerErrorException(
        'Failed to generate vocabulary using AI',
      );
    }
  }
}
