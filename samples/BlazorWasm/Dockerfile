FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["samples/BlazorWasm/BlazorWasm.csproj", "samples/BlazorWasm/"]
COPY ["src/Penman.Blazor.Quill/Penman.Blazor.Quill.csproj", "src/Penman.Blazor.Quill/"]
RUN dotnet restore "samples/BlazorWasm/BlazorWasm.csproj"
COPY . .
WORKDIR "/src/samples/BlazorWasm"
RUN dotnet build "BlazorWasm.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BlazorWasm.csproj" -c Release -o /app/publish

FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html
COPY --from=publish /app/publish/wwwroot .
COPY --from=publish /app/publish/nginx.conf /etc/nginx/nginx.conf