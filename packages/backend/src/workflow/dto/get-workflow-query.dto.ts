import { IsOptional, IsString, IsBooleanString, IsInt, Min, IsIn } from "class-validator";
import { Type } from "class-transformer";

export class GetWorkflowsQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsBooleanString()
    archived?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit = 20;

    @IsOptional()
    @IsIn(["name", "createdAt", "updatedAt"])
    sortBy = "updatedAt";

    @IsOptional()
    @IsIn(["ASC", "DESC"])
    sortOrder: "ASC" | "DESC" = "DESC";
}
