'use client'
import InputField from '@/components/forms/InputField'
import SelectField from '@/components/forms/SelectField'
import { Button } from '@/components/ui/button'
import { INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS } from '@/lib/constants'
import React from 'react'

import { SubmitHandler, useForm } from 'react-hook-form'
import {CountrySelectField} from '@/components/forms/CountrySelectField'
import FooterLink from '@/components/forms/FooterLink'
import { signUpWithEmail } from '@/lib/actions/auth.actions'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const SignUp = () => {
  const router = useRouter();
    const {
    register,
    handleSubmit,
    control,
    formState: { errors,isSubmitting },
  } = useForm<SignUpFormData>({
    defaultValues: {    
        fullName: '',
        email: '',
        password: '',
        country: 'US',
        investmentGoals: 'Growth',
        riskTolerance: 'Medium',
        preferredIndustry: 'Technology',
    },
        mode: 'onBlur', 
  })
  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    try { 
        // signupWithEmail
        const result = await signUpWithEmail(data);
        if(result.success) router.push('/');
    }
    catch (error) {
        console.error('Error during sign up:', error);
        toast.error('Sign up Failed' , {
          description : error instanceof Error ? error.message : "Failed to create an account "
        })
    }
  }

  return (
    <>
        <h1 className="form-title">Signup and Personalized</h1>
        <form action="" onSubmit={handleSubmit(onSubmit)} className="space-y-5"> 
          <InputField 
            name="fullName"
            label="Full Name"
            placeholder="Enter your full name"
            register={register}
            error={errors.fullName}
            validation={{ required: "Full name is required", minLength: 2 }}
          />
          <InputField 
            name="email"
            label="Email"
            placeholder="Enter your email"
            register={register}
            error={errors.email}
            validation={{ required: "Email is required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" } }}
          />
          <InputField 
            name="password"
            label="Password"
            placeholder="Enter a strong password"
            type="password"
            register={register}
            error={errors.password}
            validation={{ required: "Password is required", minLength: 8 }}
          />

          <CountrySelectField
            name="country"
            label="Country"
            control={control}
            error={errors.country}
            required
          />
          <SelectField 
            name="investmentGoals"
            label="Investment Goals"
            placeholder="Select your investment goals"
            options={INVESTMENT_GOALS}
            control={control}
            error={errors.investmentGoals}
            required
          />
          <SelectField 
            name="riskTolerance"
            label="Risk Tolerance"
            placeholder="Select your risk level"
            options={RISK_TOLERANCE_OPTIONS}
            control={control}
            error={errors.riskTolerance}
            required
          />
          <SelectField 
            name="preferredIndustry"
            label="Preferred Industry"
            placeholder="Select your preferred industry"
            options={PREFERRED_INDUSTRIES}
            control={control}
            error={errors.preferredIndustry}
            required
          />
          <Button type="submit"  disabled={isSubmitting} className="yellow-btn w-full mt-5">
            {isSubmitting ? 'Signing Up...' : 'Start your investment journey'}
          </Button>
          <FooterLink text={'Already have an account?'} linkText={'Sign in'} href={' /sign-in'}/>
        </form>
    </>
  )
}

export default SignUp