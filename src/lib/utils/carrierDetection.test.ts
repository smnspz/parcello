/**
 * Unit tests for carrier detection utilities
 */

import { describe, it, expect } from 'vitest';
import {
    detectCarrierFromPattern,
    createUserSpecifiedResult,
    getNativeSupportedCarriers,
} from './carrierDetection';

describe('carrierDetection', () => {
    describe('detectCarrierFromPattern', () => {
        describe('Poste Italiane', () => {
            it('should detect standard international format', () => {
                const result = detectCarrierFromPattern('RM123456789IT');
                expect(result.carrier).toBe('poste-italiane');
                expect(result.confidence).toBe('high');
                expect(result.method).toBe('pattern');
            });

            it('should detect various prefix formats', () => {
                const formats = [
                    'RM123456789IT',
                    'RN987654321IT',
                    'CP111222333IT',
                ];
                formats.forEach((tracking) => {
                    const result = detectCarrierFromPattern(tracking);
                    expect(result.carrier).toBe('poste-italiane');
                });
            });

            it('should be case insensitive', () => {
                const result = detectCarrierFromPattern('rm123456789it');
                expect(result.carrier).toBe('poste-italiane');
            });
        });

        describe('InPost', () => {
            it('should detect 18-digit format starting with 63', () => {
                const result = detectCarrierFromPattern('630123456789012345');
                expect(result.carrier).toBe('inpost');
                expect(result.confidence).toBe('high');
            });

            it('should detect 16-digit format starting with 59', () => {
                const result = detectCarrierFromPattern('5900123456789012');
                expect(result.carrier).toBe('inpost');
            });
        });

        describe('BRT FermoPoint', () => {
            it('should detect BRT prefix format', () => {
                const result = detectCarrierFromPattern('BRT1234567890');
                expect(result.carrier).toBe('brt-fermopoint');
                expect(result.confidence).toBe('high');
            });

            it('should be case insensitive', () => {
                const result = detectCarrierFromPattern('brt1234567890');
                expect(result.carrier).toBe('brt-fermopoint');
            });
        });

        describe('GLS', () => {
            it('should detect GLS prefix format with hyphen', () => {
                const result = detectCarrierFromPattern('GLS-1234567890');
                expect(result.carrier).toBe('gls');
            });

            it('should detect GLS prefix format with space', () => {
                const result = detectCarrierFromPattern('GLS 12345678901');
                expect(result.carrier).toBe('gls');
            });

            it('should detect GLS prefix without separator', () => {
                const result = detectCarrierFromPattern('GLS1234567890');
                expect(result.carrier).toBe('gls');
            });
        });

        describe('DHL Express', () => {
            it('should detect waybill format', () => {
                const result = detectCarrierFromPattern('JJD012345678901234');
                expect(result.carrier).toBe('dhl-express');
                expect(result.confidence).toBe('high');
            });

            it('should be case insensitive for waybill', () => {
                const result = detectCarrierFromPattern('jjd012345678901234');
                expect(result.carrier).toBe('dhl-express');
            });
        });

        describe('Edge cases', () => {
            it('should handle whitespace trimming', () => {
                const result = detectCarrierFromPattern('  RM123456789IT  ');
                expect(result.carrier).toBe('poste-italiane');
            });

            it('should handle hyphen removal', () => {
                const result = detectCarrierFromPattern('GLS-1234567890');
                expect(result.carrier).toBe('gls');
            });

            it('should return none for empty string', () => {
                const result = detectCarrierFromPattern('');
                expect(result.carrier).toBeUndefined();
                expect(result.confidence).toBe('none');
                expect(result.method).toBe('unknown');
            });

            it('should return none for whitespace only', () => {
                const result = detectCarrierFromPattern('   ');
                expect(result.carrier).toBeUndefined();
                expect(result.confidence).toBe('none');
            });

            it('should return none for unknown format', () => {
                const result = detectCarrierFromPattern('UNKNOWN123ABC');
                expect(result.carrier).toBeUndefined();
                expect(result.confidence).toBe('none');
                expect(result.method).toBe('unknown');
            });
        });
    });

    describe('createUserSpecifiedResult', () => {
        it('should create result with user_specified method', () => {
            const result = createUserSpecifiedResult('ups');
            expect(result.carrier).toBe('ups');
            expect(result.confidence).toBe('high');
            expect(result.method).toBe('user_specified');
        });

        it('should work with any carrier code', () => {
            const result = createUserSpecifiedResult('custom-carrier');
            expect(result.carrier).toBe('custom-carrier');
            expect(result.method).toBe('user_specified');
        });
    });

    describe('getNativeSupportedCarriers', () => {
        it('should return all native carriers', () => {
            const carriers = getNativeSupportedCarriers();
            expect(carriers).toContain('poste-italiane');
            expect(carriers).toContain('inpost');
            expect(carriers).toContain('brt-fermopoint');
            expect(carriers).toContain('gls');
            expect(carriers).toContain('dhl-express');
        });

        it('should return exactly 5 carriers', () => {
            const carriers = getNativeSupportedCarriers();
            expect(carriers).toHaveLength(5);
        });

        it('should return only strings', () => {
            const carriers = getNativeSupportedCarriers();
            carriers.forEach((carrier) => {
                expect(typeof carrier).toBe('string');
            });
        });
    });
});
