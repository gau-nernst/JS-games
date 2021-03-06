import { Solver } from '../math.js'

class Finance {
    /**
     * Time Value of Money (TVM) solver
     * @param {string} find - Name of variable to find e.g. n, ir, pv, pmt, fv
     * @param {number[]} otherArguments - Follow this order, without the 'find' parameter: n, ir, pv, pmt, fv
     * 
     * E.g. You want to find Present value, given periods = 10, interest rate = 5, payment = 0, future value = 1000. You will write Finance.tvm('pv', 10, 5, 0, 1000)
     */
    static tvm = (find: string, ...otherArguments: number[]) => {
        let n: number, ir: number, pv: number, pmt: number, fv: number,
            rate: number, discount: number, pmt_r: number
        switch(find){
            case 'n':
                [ir, pv, pmt, fv] = otherArguments

                return Math.log((pmt/ir - fv) / (pmt/ir + pv))/Math.log(1+ir);
            case 'ir':
                [n, pv, pmt, fv] = otherArguments

                let calc_fv = (r: number) => (r==0) ? pv + pmt*n + fv : pv*(1+r)**n + pmt/r*((1+r)**n - 1) + fv
                let derivative_fv = (r: number) => (r==0) ? pv*n + pmt*n*(n-1)/2 : pv*n*(1+r)**(n-1) + pmt/r**2*(n*(1+r)**(n-1)*r-(1+r)**n+1)

                return Solver.root(calc_fv, derivative_fv, 0.1)
            case 'pv':
                [n, ir, pmt, fv] = otherArguments
                rate = 1 + ir
                discount = rate**n
                pmt_r = pmt/ir

                return -pmt_r * (1 - 1/discount) - fv/discount;
            case 'pmt':
                [n, ir, pv, fv] = otherArguments
                rate = 1 + ir,
                discount = rate**n;

                return (-fv - pv*discount) * ir / (discount - 1);
            case 'fv':
                [n, ir, pv, pmt] = otherArguments
                rate = 1 + ir,
                discount = rate**n,
                pmt_r = pmt/ir;
                
                return -pmt_r * (discount - 1) - pv*discount;
        }  
    }

    /**
     * Calculate Net Present Value
     * @param {number} cf0 - Initial cash flow
     * @param {number[]} list_cf - List of subsequent cash flows
     * @param {number[]} list_freq - List of frequencies
     * @param {number} discountRate - Discount rate
     */
    static npv = (cf0: number, list_cf: number[], list_freq: number[], discountRate: number) => {
        if(list_cf.length != list_freq.length) {
            console.log('Cashflow and Frequency lists don\'t have the same length')
            return 0
        }
        let sum = cf0
        let freq_sum = 0
        
        if(discountRate!=0) {
            for(let i=0; i<list_cf.length; i++) {
                let cf = list_cf[i],
                    freq = list_freq[i]
                
                sum += cf/discountRate*(1-1/(1+discountRate)**freq) / (1+discountRate)**freq_sum
                freq_sum += freq
            }
        } else {
            for(let i=0; i<list_cf.length; i++) {
                let cf = list_cf[i],
                    freq = list_freq[i]
                
                sum += cf*freq
            }
        }

        return sum

    }
    
    /**
     * Calculate Internal Rate of Return for a given cash flows stream. It is the rate at which NPV = 0
     * @param {number} cf0 - Initial cash flow
     * @param {number[]} list_cf - List of subsequent cash flows
     * @param {number[]} list_freq - List of frequencies
     */
    static irr = (cf0: number, list_cf: number[], list_freq: number[]) => {
        /**
         * Using secant method to solve
         */
        let npvFunction = (r: number) => Finance.npv(cf0, list_cf, list_freq, r)

        let npvDerivative = (r: number) => {
            let sum = 0
            let freq_sum = 0
        
            if(r!=0) {
                for(let i=0; i<list_cf.length; i++) {
                    let cf = list_cf[i],
                        freq = list_freq[i]

                    sum += cf/r/(1+r)**freq_sum * ( (1/r + (freq+freq_sum)/(1+r)/(1+r)**freq) - 1/r - freq_sum/(1+r) )
                    freq_sum += freq
                }
            } else {
                for(let i=0; i<list_cf.length; i++) {
                    let cf = list_cf[i],
                        freq = list_freq[i]
                    
                    sum += cf*freq*freq_sum*(1+freq_sum+freq)
                    freq_sum += freq
                }
            }
        
            return sum
        }

        // return Solver.root('secant', npvFunction, 0.1, 0.2)
        // Newton's method yields wrong result. Possibly because npvDerivative() is wrong

    }

    static mirr = (cf0: number, list_cf: number[], list_freq: number[], wacc: number) => {

    }

    static payback = (cf0: number, list_cf: number[], list_freq: number[]) => {

    }

    static discountedPayback = (cf0: number, list_cf: number[], list_freq: number[], wacc: number) => {
        
    }
}



export { Finance }
